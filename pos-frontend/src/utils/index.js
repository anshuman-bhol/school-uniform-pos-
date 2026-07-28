export const getBgColor=()=>{
    const bgarr=[
        "#b73e3e", 
        "#5b45b0", 
        "#735f32", 
        "#1d2569", 
        "#285430", 
        "#f6b100", 
        "#be3e3f", 
        "#02ca3a",
    ];
    const randomBg=Math.floor(Math.random() * bgarr.length);
    const color=bgarr[randomBg];
    return color;
}

export const getAvatarName=(name)=>{
    if (!name) return "";
    return name.split(" ").map(word=>word[0]).join("").toUpperCase();
}

export const formatDate = (date) => {

    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;

};

export const formatDateAndTime = (date) => {

    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    return d.toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });

};