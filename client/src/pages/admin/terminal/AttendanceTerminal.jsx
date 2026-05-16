import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Flame, Activity, ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { attendanceApi } from "../../../api";
import { QRCodeSVG } from 'qrcode.react';

export default function AttendanceTerminal() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("------");
  const [exitHoldTimer, setExitHoldTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [latestCheckin, setLatestCheckin] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const fetchPin = useCallback(async () => {
    try {
      const { data } = await attendanceApi.getKioskPin();
      if (data?.data?.pin && data.data.pin !== pin) {
        setPin(data.data.pin);
        setTimeLeft(30);
      }
    } catch (err) {
      console.error("Failed to fetch terminal PIN", err);
    }
  }, [pin]);

  const fetchRecent = useCallback(async () => {
    try {
      const { data } = await attendanceApi.getToday();
      if (data?.data) {
        setRecentAttendances((prev) => {
          const newTop = data.data[0];
          const oldTop = prev[0];
          if (newTop && (!oldTop || oldTop._id !== newTop._id)) {
            const isRecent = new Date() - new Date(newTop.checkedInAt) < 15000;
            if (isRecent) {
              setLatestCheckin(newTop);
              setTimeout(() => setLatestCheckin(null), 4000);
            }
          }
          return data.data.slice(0, 3);
        });
      }
    } catch (err) {
      console.error("Failed to fetch recent attendance", err);
    }
  }, []);

  // Initial fetch and poll every 5 seconds for PIN, 3 seconds for Live Feed
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPin();
      fetchRecent();
    }, 0);
    const pinInterval = setInterval(fetchPin, 5000);
    const feedInterval = setInterval(fetchRecent, 3000);
    return () => {
      clearTimeout(t);
      clearInterval(pinInterval);
      clearInterval(feedInterval);
    };
  }, [fetchPin, fetchRecent]);

  // Local countdown timer for visual feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Terminal Lockdown Logic ────────────────────────────────────
  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
    };

    const preventShortcuts = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) e.preventDefault();
      if (["F1", "F3", "F5", "F6", "F7", "F10", "F11", "F12"].includes(e.key))
        e.preventDefault();
    };

    window.addEventListener("contextmenu", preventDefaults);
    window.addEventListener("keydown", preventShortcuts);

    const enterFS = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen request failed", err);
      }
    };

    window.addEventListener("click", enterFS, { once: true });

    return () => {
      window.removeEventListener("contextmenu", preventDefaults);
      window.removeEventListener("keydown", preventShortcuts);
    };
  }, []);

  const startExitTimer = () => {
    const timer = setTimeout(() => {
      if (window.confirm("Admin: Exit Terminal Mode?")) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        navigate("/admin/dashboard");
      }
    }, 5000);
    setExitHoldTimer(timer);
  };

  const clearExitTimer = () => {
    if (exitHoldTimer) clearTimeout(exitHoldTimer);
    setExitHoldTimer(null);
  };

  return (
    <div
      className="mobile-p-4"
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <AnimatePresence>
        {latestCheckin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(16,185,129,0.95)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              style={{
                width: 200, height: 200, borderRadius: "50%",
                border: "8px solid white", overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)", marginBottom: 32,
                background: "rgba(0,0,0,0.2)", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {latestCheckin.memberId?.photo ? (
                <img
                  src={latestCheckin.memberId.photo}
                  alt="Member"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "5rem", fontWeight: 900 }}>
                  {latestCheckin.memberId?.firstName?.[0] || "M"}
                </span>
              )}
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: "3rem", fontWeight: 900, margin: 0, textTransform: "uppercase", letterSpacing: "2px", textAlign: "center" }}
            >
              ACCESS GRANTED
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: "1.5rem", fontWeight: 800, margin: "12px 0 0 0", opacity: 0.9, textAlign: "center" }}
            >
              {latestCheckin.memberId?.firstName} {latestCheckin.memberId?.lastName}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          width: "100%", maxWidth: 450, display: "flex",
          justifyContent: "space-between", alignItems: "center", marginBottom: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div
            onMouseDown={startExitTimer}
            onMouseUp={clearExitTimer}
            onTouchStart={startExitTimer}
            onTouchEnd={clearExitTimer}
            style={{ display: "flex", alignItems: "center", gap: 12, cursor: "default" }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 12, background: "var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Activity color="#000" size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
                GymCore <span style={{ color: "var(--primary)" }}>Terminal</span>
              </h1>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Secure Access Node
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowQR(!showQR)}
            style={{
              width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", color: showQR ? "var(--primary)" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <Camera size={18} />
          </button>
          <div
            style={{
              padding: "6px 12px", background: "rgba(255,255,255,0.05)",
              borderRadius: 10, fontSize: "0.7rem", fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.1)", display: 'flex', alignItems: 'center'
            }}
          >
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 450, position: "relative" }}>
        <AnimatePresence mode="wait">
          {showQR ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
                padding: '40px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ background: 'white', padding: '20px', borderRadius: '24px' }}>
                <QRCodeSVG value="GYMFLOW_TERMINAL_01" size={200} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px' }}>SYNC PROTOCOL</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-4)', maxWidth: '240px' }}>Scan this code with your Member App to initiate instant synchronization.</p>
              </div>
              <button 
                onClick={() => setShowQR(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px 20px', borderRadius: '12px', color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
              >
                RETURN TO PIN MODE
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                  Enter your unique access PIN to synchronize with the terminal.
                </p>
              </div>
              <div
                style={{
                  height: 140, width: "100%", background: "rgba(255,255,255,0.02)",
                  borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 16, position: "relative", overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ opacity: [0.02, 0.06, 0.02] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ position: "absolute", inset: 0, background: "var(--primary)" }}
                />
                {pin.split("").map((char, i) => (
                  <motion.div
                    key={`${pin}-${i}`}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    style={{
                      width: 55, height: 75, borderRadius: 16,
                      border: "2px solid rgba(245,158,11,0.3)", background: "rgba(0,0,0,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)",
                    }}
                  >
                    {char}
                  </motion.div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Refreshes in {timeLeft}s
                </div>
                <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{ height: "100%", background: "var(--primary)" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: 40, width: "100%" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", animation: "pulse-glow 2s infinite" }} />
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-3)" }}>
              Live Terminal Sync
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence>
              {recentAttendances.map((record) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 16, padding: "16px", display: "flex",
                    alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)",
                        overflow: "hidden", display: "flex", alignItems: "center",
                        justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {record.memberId?.photo ? (
                        <img src={record.memberId.photo} alt={record.memberId.firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.2rem" }}>
                          {record.memberId?.firstName?.[0] || "M"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
                        {record.memberId?.firstName} {record.memberId?.lastName}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 800, textTransform: "uppercase", marginTop: 2 }}>
                        Access Granted
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-2)" }}>
                      {new Date(record.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 4, color: "var(--primary)", fontSize: "0.7rem", fontWeight: 800 }}>
                      <Flame size={12} /> {record.memberId?.streak || 0}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {recentAttendances.length === 0 && (
              <div style={{ textAlign: "center", padding: 32, background: "rgba(255,255,255,0.01)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.05)" }}>
                <p style={{ color: "var(--text-4)", fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>
                  Waiting for secure terminal connections...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <div style={{ marginTop: "auto", textAlign: "center", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em" }}>
          <ShieldCheck size={14} /> ENCRYPTED PROTOCOL ACTIVE | GYM-FLW-TRM-01
        </div>
      </div>
    </div>
  );
}
