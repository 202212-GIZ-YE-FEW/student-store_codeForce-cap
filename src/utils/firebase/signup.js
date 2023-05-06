import { sendEmailVerification } from "firebase/auth"
import { toast } from "react-toastify"

import { createUserDoc, getUserDoc } from "./add-user"
import { signInWithFacebook, signInWithGoogle, signUpWithEmail } from "./auth"

export default async function signUp(
  email,
  password,
  firstName,
  surname,
  schoolName,
  method = "email"
) {
  let result = null,
    error = null

  try {
    if (method === "email") {
      const user = await signUpWithEmail(email, password)
      const userId = user.uid
      const userDoc = await getUserDoc(userId)

      if (userDoc.exists()) {
        toast.error("Already exists")
      } else {
        await createUserDoc(
          userId,
          firstName,
          surname,
          email,
          schoolName,
          password
        )

        // Send email verification
        await sendEmailVerification(user)
          .then(() => {
            // Save user information to local storage
            localStorage.setItem("user", JSON.stringify(user))
          })
          .then(() => {
            // Signed in successfully
            toast.success("Welcome to our website. You are logged in directly")
          })
        result = { email: user.email, verified: user.emailVerified }
      }
    } else if (method === "facebook") {
      const user = await signInWithFacebook()
      const userId = user.uid
      const userDoc = await getUserDoc(userId)

      if (userDoc.exists()) {
        toast.error("Already exists")
      } else {
        await createUserDoc(userId, firstName, surname, user.email, schoolName)
          .then(() => {
            toast.success("Welcome to our website. You are logged in directly")
          })
          .then(() => {
            // Save user information to local storage
            localStorage.setItem("user", JSON.stringify(user))
          })
      }
    } else if (method === "google") {
      const user = await signInWithGoogle()
      const userId = user.uid
      const userDoc = await getUserDoc(userId)

      if (userDoc.exists()) {
        toast.error("Already exists")
      } else {
        await createUserDoc(userId, firstName, surname, user.email, schoolName)
          .then(() => {
            toast.success("Welcome to our website. You are logged in directly")
          })
          .then(() => {
            // Save user information to local storage
            localStorage.setItem("user", JSON.stringify(user))
          })
      }
    }
  } catch (e) {
    error = e
    toast.error(error.message, "Your email is already exists")
  }

  return { result, error }
}
