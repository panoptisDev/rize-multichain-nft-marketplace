import clsx from "clsx";
import Marquee3D from "components/Marquee3D";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "app/config";
import { useEffect, useState } from "react";

const SectionMainSlider = () => {
  const [rizeMemeberCollectionId, setRizeMemberCollectionId] = useState(
    "6460aff6565e58a809f2f414"
  );
  const navigate = useNavigate();
  const getRizeMemberCollectionId = () => {
    axios
      .post(`${config.API_URL}api/collection/getRizeMemberCollectionId`)
      .then((response) => {
        setRizeMemberCollectionId(response.data.data[0]);
      })
      .catch((error) => {
        console.log("getRizeMemberCollectionId() error ===> ", error);
      });
  };
  useEffect(() => {
    getRizeMemberCollectionId();
  }, []);
  return (
    <>
      <div className="relative flex flex-col items-center justify-center mt-1 mb-6">
        <p className="text-4xl font-semibold mb-4 text-neutral-900 dark:text-white">
          Rize Member NFTs
        </p>
        <p className="text-base w-1/2 text-center mb-6 text-neutral-900 dark:text-white">
          A limited collection of 100 Stelliforms; 3D meditative sculptures that
          contain unique form, movement, and material compositions. Fully
          interoperable and XR ready.
        </p>
        <div className="relative flex items-center justify-center gap-5 flex-col md:flex-row ">
          <ButtonPrimary
            onClick={() =>
              navigate("collectionItems/" + rizeMemeberCollectionId)
            }
            className="w-[220px] rounded-3xl"
          >
            RIZE MEMBER NFTs
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => navigate("page-search")}
            className="w-[220px] rounded-3xl"
          >
            VIEW ALL NFTs
          </ButtonPrimary>
        </div>
      </div>
      <div
        className={clsx(
          "absolute bg-[#33FF00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full -top-[100px] -left-[100px]"
        )}
      ></div>
      <Marquee3D />
    </>
  );
};

export default SectionMainSlider;