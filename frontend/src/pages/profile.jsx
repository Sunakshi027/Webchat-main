import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import avtar from "../assets/avrar.jpg";
import {
  getCurrentUser,
  updateProfile,
} from "../api/userapi";

const Profile = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  // ================= GET CURRENT USER =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getCurrentUser();
        const user = data.user || data;
        console.log("Current User:", user);
        setCurrentUser(user);

        // Fill form with existing data
        reset({
          fullName: user.fullName || "",
          bio: user.bio || "",
        });

        // Show existing profile picture
        if (user.profilePic) {
          setImagePreview(user.profilePic);
        }

      } catch (error) {
        console.error(
          "Failed to load profile:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ================= UPDATE PROFILE =================
  const onSubmit = async (data) => {
    try {
      setUpdating(true);

      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("bio", data.bio || "");

      if (selectedFile) {
        formData.append("profilePic", selectedFile);
      }

      const response = await updateProfile(formData);

      console.log("Profile Updated:", response);

      const updatedUser = response.user || response;

      setCurrentUser(updatedUser);

      if (updatedUser.profilePic) {
        setImagePreview(updatedUser.profilePic);
      }


    } catch (error) {
      console.error(
        "Profile update failed:",
        error.response?.data || error.message
      );

      alert("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-100 flex items-center justify-center p-5">
     
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          w-full max-w-md
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-lg
          p-6 sm:p-8
        "
      >
      
         <button
      onClick={() => navigate("/")}
      className="flex items-center gap-3 px-4 py-3 text-gray-600
                 hover:text-black hover:bg-gray-100 rounded-xl
                 transition-all duration-200"
    >
      <FiHome size={20} />
      <span>Back</span>
    </button>




        {/* ================= HEADING ================= */}
        <div className="text-center mb-7">

          <h1 className="text-2xl font-semibold text-gray-800">
            Profile Details
          </h1>
        </div>


        {/* ================= AVATAR ================= */}
        <label
          htmlFor="avatar"
          className="flex flex-col items-center mb-7 cursor-pointer group"
        >

          <input
            type="file"
            id="avatar"
            accept="image/*"
            {...register("avatar")}
            onChange={handleImageChange}
            hidden
          />

          <div
            className="
              relative
              w-24 h-24
              rounded-full
              overflow-hidden
              border-2 border-gray-200
              transition-all duration-300
              group-hover:border-blue-500
            "
          >

            <img
              src={imagePreview || avtar}
              alt="avatar"
              className="w-full h-full object-cover"
            />

            {/* Hover Overlay */}
            <div
              className="
                absolute inset-0
                bg-black/40
                opacity-0
                group-hover:opacity-100
                flex items-center justify-center
                transition-all duration-300
              "
            >
              <span className="text-white text-xs font-medium">
                Change
              </span>
            </div>

          </div>

          <span
            className="
              mt-3
              text-sm
              text-blue-600
              font-medium
            "
          >
            Change profile picture
          </span>

        </label>


        {/* ================= USER INFO ================= */}
        <div className="mb-6 text-center">

          <h2 className="text-xl font-semibold text-gray-800">
            {currentUser?.fullName}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {currentUser?.email}
          </p>
         <p className="text-sm text-gray-500 mt-1">
            {currentUser?.bio}
          </p>
        </div>


        {/* ================= FULL NAME ================= */}
        <div className="mb-5">

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              px-4 py-3
              rounded-lg
              border border-gray-300
              bg-white
              text-sm text-gray-700
              outline-none
              placeholder:text-gray-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.fullName.message}
            </p>
          )}

        </div>


        {/* ================= EMAIL ================= */}
        <div className="mb-5">

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>

          <input
            type="email"
            value={currentUser?.email || ""}
            readOnly
            className="
              w-full
              px-4 py-3
              rounded-lg
              border border-gray-200
              bg-gray-100
              text-sm text-gray-500
              outline-none
              cursor-not-allowed
            "
          />

        </div>


        {/* ================= BIO ================= */}
        <div className="mb-6">

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio
          </label>

          <textarea
            placeholder="Write something about yourself..."
            {...register("bio")}
            className="
              w-full
              h-28
              px-4 py-3
              rounded-lg
              border border-gray-300
              bg-white
              text-sm text-gray-700
              outline-none
              resize-none
              placeholder:text-gray-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

        </div>


        {/* ================= UPDATE BUTTON ================= */}
        <button
          type="submit"
          disabled={updating}
          className="
            w-full
            py-3
            rounded-lg
            bg-blue-600
            text-white
            text-sm
            font-semibold
            transition-all duration-300
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {updating ? "Updating..." : "Update Profile"}
        </button>

      </form>

    </div>
  );
};

export default Profile;