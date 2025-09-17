import { useDispatch, useSelector } from "react-redux";
import LandingPage from "./LandingPage";
import { useNavigate } from "react-router-dom";
import { setGetStarted } from "../../../common/commonSlice";
import React, { useEffect } from "react";

const ShowLandingPage = () => {
  const { isGetStarted } = useSelector((state) => state.common);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    if (isGetStarted) {
      navigate("/login");
    }
  }, [isGetStarted, navigate]);

  return (
    !isGetStarted && (
      <LandingPage onClick={() => dispatch(setGetStarted(true))} />
    )
  );
};

export default React.memo(ShowLandingPage);
