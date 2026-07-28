import { useEffect, useRef, useState } from "react";

const OtpLogin = ({ setLoginMode }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!otpSent || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = () => {
    if (phone.length !== 10) return;

    // Backend call will come later

    setOtpSent(true);
    setTimer(30);
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const values = pasted.split("");

    const arr = [...otp];

    values.forEach((digit, i) => {
      arr[i] = digit;
    });

    setOtp(arr);

    inputRefs.current[Math.min(values.length, 5)]?.focus();

    e.preventDefault();
  };

  const verifyOtp = () => {
    const code = otp.join("");

    console.log({
      phone,
      code,
    });

    // Backend verification later
  };

  return (
    <div>

      {/* Phone */}

      <label className="block text-[#ababab] mb-2 text-sm font-medium">
        Mobile Number
      </label>

      <div className="flex bg-[#1f1f1f] rounded-lg overflow-hidden">

        <div className="px-4 flex items-center text-yellow-400 font-semibold">
          +91
        </div>

        <input
          type="tel"
          maxLength={10}
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value.replace(/\D/g, "")
            )
          }
          placeholder="Enter mobile number"
          className="flex-1 bg-transparent p-4 text-white outline-none"
        />

      </div>

      <button
        type="button"
        disabled={phone.length !== 10}
        onClick={handleSendOtp}
        className={`w-full mt-6 py-3 rounded-lg font-bold ${
          phone.length === 10
            ? "bg-yellow-400 text-[#1a1a1a]"
            : "bg-[#444] text-gray-400 cursor-not-allowed"
        }`}
      >
        {otpSent ? "OTP Sent" : "Send OTP"}
      </button>

      {otpSent && (
        <>
          <label className="block text-[#ababab] mt-8 mb-3 text-sm font-medium">
            Enter OTP
          </label>

          <div
            onPaste={handlePaste}
            className="flex justify-between"
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) =>
                  (inputRefs.current[index] = el)
                }
                value={digit}
                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                maxLength={1}
                className="w-14 h-14 bg-[#1f1f1f] rounded-lg text-center text-2xl text-white outline-none focus:border-2 focus:border-yellow-400"
              />
            ))}
          </div>

          <div className="flex justify-between mt-5 text-sm">

            <button
              disabled={timer > 0}
              className={`${
                timer > 0
                  ? "text-gray-500"
                  : "text-yellow-400"
              }`}
            >
              {timer > 0
                ? `Resend OTP (${timer}s)`
                : "Resend OTP"}
            </button>

            <button
              onClick={verifyOtp}
              className="text-green-400"
            >
              Verify OTP
            </button>

          </div>
        </>
      )}

      <button onClick={() => setLoginMode("password")}
        className="mt-8 w-full text-yellow-400 hover:underline">
        ← Back to Password Login
      </button>

    </div>
  );
};

export default OtpLogin;