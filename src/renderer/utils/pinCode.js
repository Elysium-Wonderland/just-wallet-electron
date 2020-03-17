function validatePin(pin) {
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,1000}$/;

    if(!pwdRegex.test(pin)) {
        return false;
    }
    return true;
}

export default {
    validatePin
}
