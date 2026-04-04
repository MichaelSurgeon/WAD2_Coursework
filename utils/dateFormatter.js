export const fmtDate = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

export const fmtDateOnly = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "";

export const fmtDateForInput = (iso) =>
    iso ? iso.split("T")[0] : "";