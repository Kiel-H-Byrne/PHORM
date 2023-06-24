import { createUserWithEmailAndPassword } from "firebase/auth";
import { appAuth } from "./firebase";

export default async function signUp(email: string, password: string) {
    let result = null,
        error = null;
    try {
        result = await createUserWithEmailAndPassword(appAuth, email, password);
    } catch (e) {
        error = e;
    }

    return { result, error };
}
