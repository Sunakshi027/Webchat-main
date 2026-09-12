+import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { loginUser, registerUser } from "../api/authapi";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      let response;

      if (isSignUp) {
        response = await registerUser(data);
      } else {
        response = await loginUser(data);
      }

      console.log("LOGIN RESPONSE:", response);
      console.log("TOKEN:", response?.token);

      // Check token
      if (!response?.token) {
        console.log("TOKEN NOT FOUND IN RESPONSE");
        return;
      }

      // Save token
      localStorage.setItem("token", response.token);

      console.log(
        "SAVED TOKEN:",
        localStorage.getItem("token")
      );

      // =========================
      // SUCCESS MESSAGE
      // =========================

      setSuccessMessage(
        isSignUp
          ? "Account created successfully! 🎉"
          : "Login successful! Welcome to WebChat 🎉"
      );

      // =========================
      // GO TO CHAT
      // =========================

      setTimeout(() => {
        navigate("/home");
      }, 1200);

    } catch (error) {
      console.log(
        "LOGIN/REGISTER ERROR:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-100
        px-5
        py-8
        relative
      "
    >

      {/* =========================
          SUCCESS POPUP
      ========================= */}

      {successMessage && (
        <div
          className="
            fixed
            top-6
            right-6
            z-50
            bg-white
            border
            border-green-200
            shadow-xl
            rounded-xl
            px-5
            py-4
            flex
            items-center
            gap-3
            min-w-[280px]
            animate-[slideIn_.3s_ease-out]
          "
        >
          <div
            className="
              w-9
              h-9
              rounded-full
              bg-green-100
              flex
              items-center
              justify-center
              text-green-600
              text-lg
              font-bold
            "
          >
            ✓
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Success
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* =========================
          LOGIN CARD
      ========================= */}

      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-2xl
          border
          border-gray-200
          shadow-lg
          p-7
          sm:p-8
          transition-all
          duration-300
          hover:shadow-xl
        "
      >

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div
            className="
              w-14
              h-14
              rounded-full
              bg-blue-50
              flex
              items-center
              justify-center
              transition-all
              duration-300
              hover:scale-105
              hover:bg-blue-100
            "
          >
            <span className="text-2xl">
              💬
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h2
            className="
              text-2xl
              font-semibold
              text-gray-800
            "
          >
            {isSignUp
              ? "Create Account"
              : "Welcome Back"}
          </h2>

          <p
            className="
              text-sm
              text-gray-500
              mt-2
            "
          >
            {isSignUp
              ? "Create your account to start chatting"
              : "Login to continue to WebChat"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* Full Name */}
          {isSignUp && (
            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-1.5
                "
              >
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Full name is required",
                })}
                className="
                  w-full
                  px-4
                  py-3
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  text-sm
                  text-gray-700
                  outline-none
                  transition-all
                  duration-300
                  placeholder:text-gray-400
                  hover:border-gray-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
              })}
              className="
                w-full
                px-4
                py-3
                rounded-lg
                border
                border-gray-300
                bg-white
                text-sm
                text-gray-700
                outline-none
                transition-all
                duration-300
                placeholder:text-gray-400
                hover:border-gray-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
              })}
              className="
                w-full
                px-4
                py-3
                rounded-lg
                border
                border-gray-300
                bg-white
                text-sm
                text-gray-700
                outline-none
                transition-all
                duration-300
                placeholder:text-gray-400
                hover:border-gray-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="
              w-full
              py-3
              mt-2
              rounded-lg
              bg-blue-600
              text-white
              text-sm
              font-semibold
              shadow-sm
              hover:bg-blue-700
              hover:shadow-md
              hover:-translate-y-0.5
              active:translate-y-0
              active:scale-[0.98]
              transition-all
              duration-300
            "
          >
            {isSignUp
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {/* Switch Login / Signup */}
        <div
          className="
            flex
            items-center
            justify-center
            gap-1
            mt-6
            text-sm
          "
        >
          <span className="text-gray-500">
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            type="button"
            onClick={() =>
              setIsSignUp(!isSignUp)
            }
            className="
              text-blue-600
              font-medium
              hover:text-blue-700
              hover:underline
              transition-all
              duration-200
            "
          >
            {isSignUp
              ? "Login"
              : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;