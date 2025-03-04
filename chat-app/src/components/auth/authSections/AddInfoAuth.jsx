import Input from "../../misc/Input";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { handlePostInput, sendOTP } from "../../../utility/util";
// import { useNavigate } from "react-router-dom";
import { postData } from "../../../utility/async";
import PropTypes from "prop-types";
import {
  setEmail,
  setFirstName,
  setLastName,
} from "../../../store/redux/authSlice";
import Logo from "/logo.png";

export default function AddInfoAuth({ setActivePage }) {
  const [error, setError] = useState({});
  const { preview } = useSelector((state) => state.image);
  const { email, firstName, lastName, isSigningIn } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const { mutate: handleAuth, isPending } = useMutation({
    mutationFn: () => {
      if (!isSigningIn) {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        return postData("/user/check-input", formData);
      }
      return;
    },
    onSuccess: () => {
      sendOTP(email);
      setActivePage("codeSent");
    },
    onError: (error) => {
      setError(error.data);
    },
  });

  return (
    <div className="min-w-[500px] flex justify-center mt-28 h-screen">
      <div className="flex flex-col items-center w-[360px] text-center">
        {!isSigningIn ? (
          <div className="relative bg-[#8675DC] hover:bg-[#8765DC] h-32 w-32 text-white rounded-full my-12 group cursor-pointer">
            {preview && (
              <img
                className="w-full h-full rounded-full object-cover absolute"
                src={preview}
                alt="Chosen profile picture."
              />
            )}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="45"
                height="45"
                viewBox="0 0 24 24"
                className="group-hover:scale-120 transition-all"
              >
                <path
                  fill="currentColor"
                  d="M3 21q-.825 0-1.412-.587T1 19V7q0-.825.588-1.412T3 5h3.15L7.4 3.65q.275-.3.663-.475T8.875 3H13q.425 0 .713.288T14 4t-.288.713T13 5H8.875L7.05 7H3v12h16v-8q0-.425.288-.712T20 10t.713.288T21 11v8q0 .825-.587 1.413T19 21zM19 5h-1q-.425 0-.712-.288T17 4t.288-.712T18 3h1V2q0-.425.288-.712T20 1t.713.288T21 2v1h1q.425 0 .713.288T23 4t-.288.713T22 5h-1v1q0 .425-.288.713T20 7t-.712-.288T19 6zm-8 12.5q1.875 0 3.188-1.312T15.5 13t-1.312-3.187T11 8.5T7.813 9.813T6.5 13t1.313 3.188T11 17.5m0-2q-1.05 0-1.775-.725T8.5 13t.725-1.775T11 10.5t1.775.725T13.5 13t-.725 1.775T11 15.5"
                />
              </svg>
            </div>
            <input
              onChange={(e) =>
                handlePostInput(e.target.value, e.target.files, dispatch)
              }
              type="file"
              className="h-full w-full opacity-0 cursor-pointer"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center mb-10">
            <div className="overflow-hidden h-[13rem] -mb-12 w-[13rem] flex items-center justify-center">
              <img
                className="w-full h-full object-cover"
                src={Logo}
                alt="Logo"
              />
            </div>
          </div>
        )}
        <div className="text-3xl font-semibold flex items-center gap-2">
          <p>{isSigningIn ? "Continue sign in" : "Add more information"}</p>
        </div>
        <p className="theme-text-2 w-[70%] mt-4 text-center">
          {isSigningIn
            ? "Please verify your email to continue"
            : "Choose how you want others to see you"}
        </p>
        <div className="flex gap-4 my-4 flex-col w-full">
          <Input
            error={error}
            textClass="bg-[#202021]"
            setError={setError}
            name="email"
            inputValue={email}
            onChange={(e) => dispatch(setEmail(e.target.value))}
            type="text"
          >
            Email
          </Input>

          {!isSigningIn && (
            <>
              <Input
                error={error}
                setError={setError}
                textClass="bg-[#202021]"
                name="firstName"
                inputValue={firstName}
                onChange={(e) => dispatch(setFirstName(e.target.value))}
                type="text"
              >
                First Name
              </Input>
              <Input
                error={error}
                textClass="bg-[#202021]"
                setError={setError}
                name="lastName"
                inputValue={lastName}
                onChange={(e) => dispatch(setLastName(e.target.value))}
                type="text"
              >
                Last Name
              </Input>
            </>
          )}
        </div>
        <button
          onClick={handleAuth}
          className="bg-[#8675DC] w-full rounded-lg cursor-pointer hover:bg-[#8765DC] py-4"
        >
          {isPending ? "Checking..." : "Next"}
        </button>
      </div>
    </div>
  );
}

AddInfoAuth.propTypes = {
  setActivePage: PropTypes.func.isRequired,
};
