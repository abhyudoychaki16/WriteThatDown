export const validateEmail = (email: string) => {
    if(email === ""){
        return true;
    }
    const flags = "gm";
    const pattern = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}";
    const regexPattern = new RegExp(pattern, flags);
    const result = email.match(regexPattern);
    return result !== null;
};

export const validatePasswordLength = (password: string, minPasswordLength: number) => {
    return password.length >= minPasswordLength || password.length === 0;
};