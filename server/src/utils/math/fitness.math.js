/**
 * Mifflin-St Jeor BMR Formula
 * Formula: 
 * Male:   10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
function calculateBMR(weight, height, age, gender) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'female' ? base - 161 : base + 5;
}

/**
 * Double Progression Logic for Weights
 * If user hits target reps for all sets, increase weight and reset reps to floor.
 */
function getProgressiveTarget(sets, config = { weightInc: 2.5, repFloor: 8, repCeiling: 12 }) {
  const hitCeiling = sets.every(s => s.reps >= config.repCeiling);
  const weight = sets[0].weight;

  if (hitCeiling) {
    return {
      weight: weight + config.weightInc,
      reps: config.repFloor,
      status: 'LEVEL_UP',
      note: `Target of ${config.repCeiling} hit! Increasing to ${weight + config.weightInc}kg.`
    };
  }
  return {
    weight,
    reps: config.repCeiling,
    status: 'STAY',
    note: `Keep pushing at ${weight}kg until you hit ${config.repCeiling} reps across all sets.`
  };
}

module.exports = { calculateBMR, getProgressiveTarget };