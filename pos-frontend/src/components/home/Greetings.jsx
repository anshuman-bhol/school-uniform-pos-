import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
const Greetings = () => {

  const [dateTime, setDateTime] = useState(new Date())
  const userData = useSelector(state => state.user)

  const getGreeting = () => {
    const hour = dateTime.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Hello";
  };

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

  return (
    <div className='flex justify-between items-center px-8 mt-2'>
      <div>
        <h1 className='text-[#f5f5f5] text-2xl font-semibold tracking-wide'>{getGreeting()}, {userData?.name || "TEST USER"}</h1>
        <p className='text-[#ababab] text-sm'>Give your best service to customers</p>
      </div>
      <div>
        <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wide w-50">{formatTime(dateTime)}</h1>
        <p className='text-[#ababab] text-sm font-medium'>{formatDate(dateTime)}</p>
      </div>
    </div>
  )
}

export default Greetings
