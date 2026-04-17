export function validateEmail(email) {
        var regex = /\S+@\S+\.\S+/;
        return regex.test(email);
    }
export function validateName(name){
        var regex = /^[A-Za-z\s]+$/;
        return regex.test(name);
    }