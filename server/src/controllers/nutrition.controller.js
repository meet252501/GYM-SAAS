const FoodLog   = require('../models/FoodLog');
const Member    = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper — compute totals from entries array
const calcTotals = (entries) =>
  entries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories * e.servingsEaten),
    protein:  acc.protein  + (e.protein  * e.servingsEaten),
    carbs:    acc.carbs    + (e.carbs    * e.servingsEaten),
    fat:      acc.fat      + (e.fat      * e.servingsEaten),
    fiber:    acc.fiber    + (e.fiber    * e.servingsEaten),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

// ─── GET /api/v1/nutrition/:date ─────────────────────────────
const getDayLog = async (req, res, next) => {
  try {
    const { date } = req.params;
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    let log = await FoodLog.findOne({ memberId: member._id, date });
    if (!log) {
      log = await FoodLog.create({
        memberId: member._id,
        gymId: member.gymId,
        date,
        entries: [],
        goal: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
      });
    }

    return successResponse(res, { ...log.toObject(), totals: calcTotals(log.entries) });
  } catch (error) { next(error); }
};

// ─── POST /api/v1/nutrition/:date/entries ────────────────────
const addEntry = async (req, res, next) => {
  try {
    const { date } = req.params;
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const { name, brand, barcode, servingSize, servingsEaten, calories, protein, carbs, fat, fiber, meal } = req.body;
    if (!name || !calories) return errorResponse(res, 'name and calories are required', 400);

    const log = await FoodLog.findOneAndUpdate(
      { memberId: member._id, date },
      {
        $setOnInsert: { gymId: member.gymId },
        $push: { entries: { name, brand, barcode, servingSize: servingSize || 100, servingsEaten: servingsEaten || 1, calories, protein: protein || 0, carbs: carbs || 0, fat: fat || 0, fiber: fiber || 0, meal: meal || 'snack' } },
      },
      { new: true, upsert: true }
    );

    return successResponse(res, { ...log.toObject(), totals: calcTotals(log.entries) }, 201);
  } catch (error) { next(error); }
};

// ─── DELETE /api/v1/nutrition/:date/entries/:entryId ─────────
const deleteEntry = async (req, res, next) => {
  try {
    const { date, entryId } = req.params;
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const log = await FoodLog.findOneAndUpdate(
      { memberId: member._id, date },
      { $pull: { entries: { _id: entryId } } },
      { new: true }
    );
    if (!log) return errorResponse(res, 'Log not found', 404);

    return successResponse(res, { ...log.toObject(), totals: calcTotals(log.entries) });
  } catch (error) { next(error); }
};

// ─── PATCH /api/v1/nutrition/goal ────────────────────────────
const updateGoal = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const { calories, protein, carbs, fat } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Update all future-relevant logs and today's
    const log = await FoodLog.findOneAndUpdate(
      { memberId: member._id, date: today },
      { $set: { 'goal.calories': calories, 'goal.protein': protein, 'goal.carbs': carbs, 'goal.fat': fat } },
      { new: true, upsert: true }
    );

    return successResponse(res, log.goal);
  } catch (error) { next(error); }
};

// ─── GET /api/v1/nutrition/search?q=... ──────────────────────
const searchFood = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return errorResponse(res, 'Query too short', 400);

    const NINJA_KEY = process.env.CALORIE_NINJAS_KEY;

    if (NINJA_KEY && !q.match(/^\d+$/)) {
      // CalorieNinjas — better for natural language like "3 eggs"
      try {
        const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(q)}`, {
          headers: { 'X-Api-Key': NINJA_KEY },
        });
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const items = data.items.map(item => ({
            name:        item.name,
            brand:       '',
            barcode:     '',
            servingSize: item.serving_size_g || 100,
            calories:    Math.round(item.calories),
            protein:     parseFloat((item.protein_g || 0).toFixed(1)),
            carbs:       parseFloat((item.carbohydrates_total_g || 0).toFixed(1)),
            fat:         parseFloat((item.fat_total_g || 0).toFixed(1)),
            fiber:       parseFloat((item.fiber_g || 0).toFixed(1)),
            source:      'CalorieNinjas',
          }));
          return successResponse(res, items);
        }
      } catch (err) {
        console.warn('CalorieNinjas failed, falling back to Open Food Facts');
      }
    }

    // Comprehensive Open Food Facts — Industry standard for global products
    const offRes = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,code,nutriments,serving_size,image_front_small_url`
    );
    const offData = await offRes.json();
    const items = (offData.products || [])
      .filter(p => p.product_name && (p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal']))
      .map(p => {
        const n = p.nutriments;
        return {
          name:        p.product_name,
          brand:       p.brands || 'Generic',
          barcode:     p.code   || '',
          image:       p.image_front_small_url || '',
          servingSize: 100,
          calories:    Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein:     parseFloat((n['proteins_100g']        || n['proteins']        || 0).toFixed(1)),
          carbs:       parseFloat((n['carbohydrates_100g']   || n['carbohydrates']   || 0).toFixed(1)),
          fat:         parseFloat((n['fat_100g']             || n['fat']             || 0).toFixed(1)),
          fiber:       parseFloat((n['fiber_100g']           || n['fiber']           || 0).toFixed(1)),
          source:      'Open Food Facts',
        };
      });
    return successResponse(res, items);
  } catch (error) { next(error); }
};

// ─── GET /api/v1/nutrition/barcode/:code ─────────────────────
const barcodeSearch = async (req, res, next) => {
  try {
    const { code } = req.params;
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return errorResponse(res, 'Product not found in Open Food Facts database', 404);
    }

    const p = data.product;
    const n = p.nutriments || {};
    return successResponse(res, {
      name:        p.product_name || p.generic_name || 'Unknown Product',
      brand:       p.brands || '',
      barcode:     code,
      servingSize: parseFloat(p.serving_quantity) || 100,
      calories:    Math.round(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0),
      protein:     parseFloat((n['proteins_serving']      || n['proteins_100g']        || 0).toFixed(1)),
      carbs:       parseFloat((n['carbohydrates_serving'] || n['carbohydrates_100g']   || 0).toFixed(1)),
      fat:         parseFloat((n['fat_serving']           || n['fat_100g']             || 0).toFixed(1)),
      fiber:       parseFloat((n['fiber_serving']         || n['fiber_100g']           || 0).toFixed(1)),
      source:      'Open Food Facts',
    });
  } catch (error) { next(error); }
};

// ─── GET /api/v1/nutrition/weekly ────────────────────────────
const getWeeklyStats = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const logs = await FoodLog.find({ memberId: member._id, date: { $in: dates } });
    const logMap = Object.fromEntries(logs.map(l => [l.date, l]));

    const weekly = dates.map(date => {
      const log = logMap[date];
      const totals = log ? calcTotals(log.entries) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const goal = log?.goal?.calories || 2000;
      return { date, ...totals, goal, day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }) };
    });

    return successResponse(res, weekly);
  } catch (error) { next(error); }
};

module.exports = { getDayLog, addEntry, deleteEntry, updateGoal, searchFood, barcodeSearch, getWeeklyStats };
