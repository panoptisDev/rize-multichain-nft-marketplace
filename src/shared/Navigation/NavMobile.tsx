import React, { useEffect } from "react";
import ButtonClose from "shared/ButtonClose/ButtonClose";
import Logo from "shared/Logo/Logo";
import { Disclosure } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import { NavItemType } from "./NavigationItem";
import { NAVIGATION_DEMO_2 } from "data/navigation";
import clsx from "clsx";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import SocialsList from "shared/SocialsList1/SocialsList1";
import { ChevronDownIcon } from "@heroicons/react/solid";
import SwitchDarkMode from "shared/SwitchDarkMode/SwitchDarkMode";
import Settings from "components/Settings";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import { useNavigate } from "react-router-dom";
import { useSigningClient } from "app/cosmwasm";
import {
  changeNetwork,
  isSupportedNetwork,
} from "InteractWithSmartContract/interact";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { IoWalletOutline } from "react-icons/io5";
import {
  changeGlobalProvider,
  changeMemberOrNot,
  changeNetworkSymbol,
  changeWalletAddress,
  selectCurrentNetworkSymbol,
  selectCurrentWallet,
  selectWalletStatus,
} from "app/reducers/auth.reducers";
import { PLATFORM_NETWORKS, RPC_URLs, config } from "app/config";
import { toast } from "react-toastify";
import { getShortAddress, isEmpty } from "app/methods";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import axios from "axios";
import Web3 from "web3";
import { web3Modal } from "components/Header/MainNav2Logged";

export const infura_Id = "84842078b09946638c03157f83405213";

export interface NavMobileProps {
  data?: NavItemType[];
  onClickClose?: () => void;
}

const NavMobile: React.FC<NavMobileProps> = ({
  data = NAVIGATION_DEMO_2,
  onClickClose,
}) => {
  const navigate = useNavigate();
  const {
    client,
    signingClient,
    loadClient,
    connectWallet: connectToCoreum,
    disconnect: disconnectFromCoreum,
  }: any = useSigningClient();
  const walletStatus = useAppSelector(selectWalletStatus);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const walletAddress = useAppSelector(selectCurrentWallet);
  const dispatch = useAppDispatch();

  let previousNetworkSymbol = currentNetworkSymbol;

  const _renderMenuChild = (item: NavItemType) => {
    return (
      <ul className="nav-mobile-sub-menu pl-6 pb-1 text-base">
        {item.children?.map((i, index) => (
          <Disclosure key={i.href + index} as="li">
            <NavLink
              end
              to={{
                pathname: i.href || undefined,
              }}
              className={({ isActive }) =>
                `flex px-4 py-2.5 dark:text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-[2px] ${
                  isActive ? "text-secondary-500" : "text-neutral-900"
                }`
              }
            >
              <span
                className={!i.children ? "block w-full" : ""}
                onClick={onClickClose}
              >
                {i.name}
              </span>
              {i.children && (
                <span
                  className="block flex-grow"
                  onClick={(e) => e.preventDefault()}
                >
                  <Disclosure.Button
                    as="span"
                    className="flex justify-end flex-grow"
                  >
                    <ChevronDownIcon
                      className="ml-2 h-4 w-4 text-neutral-500"
                      aria-hidden="true"
                    />
                  </Disclosure.Button>
                </span>
              )}
            </NavLink>
            {i.children && (
              <Disclosure.Panel>{_renderMenuChild(i)}</Disclosure.Panel>
            )}
          </Disclosure>
        ))}
      </ul>
    );
  };

  const _renderItem = (item: NavItemType, index: number) => {
    return (
      <Disclosure
        key={item.id}
        as="li"
        className="text-neutral-900 dark:text-white"
      >
        <NavLink
          end
          className={({ isActive }) =>
            `flex w-full items-center py-2.5 px-4 font-medium uppercase tracking-wide text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg ${
              isActive ? "text-secondary-500" : ""
            }`
          }
          to={{
            pathname: item.href || undefined,
          }}
        >
          <span
            className={!item.children ? "block w-full" : ""}
            onClick={onClickClose}
          >
            {item.name}
          </span>
          {item.children && (
            <span
              className="block flex-grow"
              onClick={(e) => e.preventDefault()}
            >
              <Disclosure.Button
                as="span"
                className="flex justify-end flex-grow"
              >
                <ChevronDownIcon
                  className="ml-2 h-4 w-4 text-neutral-500"
                  aria-hidden="true"
                />
              </Disclosure.Button>
            </span>
          )}
        </NavLink>
        {item.children && (
          <Disclosure.Panel>{_renderMenuChild(item)}</Disclosure.Panel>
        )}
      </Disclosure>
    );
  };

  const handleSelectNetwork = async (networkSymbol) => {
    previousNetworkSymbol = currentNetworkSymbol;

    if (networkSymbol === PLATFORM_NETWORKS.COREUM) {
      // await connectToCoreum();
    } else {
      disconnectFromCoreum();
    }
    dispatch(changeNetworkSymbol(networkSymbol));
  };

  const authenticate = async (wallet_type) => {
    await connectToCoreum(wallet_type);
  };

  const handleWalletConnect = async () => {
    try {
      const walletconnect = new WalletConnectConnector({
        rpc: RPC_URLs,
        bridge: "https://bridge.walletconnect.org",
        qrcode: true,
        infuraId: infura_Id,
      });

      let connector_update = await walletconnect.activate();

      console.log("chain id:::::::::", connector_update.chainId);
      if (
        RPC_URLs.keys.filter((item) => {
          if (item == connector_update.chainId) return true;
          else return false;
        }).length == 0
      ) {
        console.log("mismatch chain id:", connector_update.chainId);
        walletconnect.deactivate();
        localStorage.removeItem("walletconnect");
        dispatch(changeWalletAddress(""));
        return;
      }

      const provider = connector_update.provider;

      const account = connector_update.account;

      dispatch(changeWalletAddress(account));
      isCommunityMember(account);

      dispatch(changeGlobalProvider(provider));
    } catch (error) {
      console.log(error);
      dispatch(changeWalletAddress(""));
    }
  };

  const handleMetaMask = async () => {
    let switchingResult = await onClickChangeEVMNetwork(currentNetworkSymbol);
    if (
      switchingResult === false &&
      isSupportedNetwork(previousNetworkSymbol) === true
    ) {
      handleSelectNetwork(previousNetworkSymbol);
    }
    if (switchingResult === true) onClickConnectEVMWallet();
  };

  const onClickConnectEVMWallet = async () => {
    try {
      const provider = await web3Modal.connect();

      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();

      if (accounts[0]) {
        dispatch(changeWalletAddress(accounts[0]));
        isCommunityMember(accounts[0]);
      } else {
        dispatch(changeWalletAddress(""));
        dispatch(changeMemberOrNot(false));
      }
      dispatch(changeGlobalProvider(provider));
    } catch (error) {
      console.log(error);
      dispatch(changeWalletAddress(""));
    }
  };

  const onClickChangeEVMNetwork = async (networkSymbol) => {
    try {
      let switchingResult = false;
      let result = await changeNetwork(networkSymbol);
      if (result) {
        if (result.success === true) {
          dispatch(changeNetworkSymbol(networkSymbol));
          switchingResult = true;
        } else {
          toast.warning(
            <div>
              <span>{result.message}</span>
              <br></br>
              <span>
                Please check your wallet. Try adding the chain to Wallet first.
              </span>
            </div>
          );
        }
      }
      return switchingResult;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    isCommunityMember(walletAddress);
  }, [walletAddress, walletStatus]);

  const isCommunityMember = (walletAddress) => {
    try {
      axios
        .post(`${config.baseUrl}users/isCommunityMember`, {
          wallet: walletAddress || "",
        })
        .then((response) => {
          let isM = response.data.data || false;
          dispatch(changeMemberOrNot(isM));
        });
    } catch (error) {
      console.log("isM error ===> ", error);
      dispatch(changeMemberOrNot(false));
    }
  };

  return (
    <div className="overflow-y-auto w-full max-w-sm h-screen py-2 transition transform shadow-lg ring-1 dark:ring-neutral-700 bg-white dark:bg-[#191818] divide-y-2 divide-neutral-100 dark:divide-neutral-800">
      <div className="py-6 px-5">
        <Logo />
        <div className="flex flex-col mt-5 text-neutral-700 dark:text-neutral-300 text-sm">
          <div className="flex justify-between items-center mt-4">
            <SocialsList className="flex items-center gap-1 sm:gap-2" />
            <span className="block">
              <Settings className="bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </span>
          </div>
        </div>
        <span className="absolute right-2 top-2 p-1">
          <ButtonClose onClick={onClickClose} />
        </span>
      </div>
      <div className="flex flex-col py-6 px-2 space-y-1">
        <div className="relative dropdown">
          <div className="overflow-hidden ">
            <div className="relative grid  px-2 py-2">
              <div
                className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.COREUM)}
              >
                <img
                  src="/images/icons/core.png"
                  className="w-[25px] h-[25px]"
                  width={25}
                  height={25}
                  alt=""
                ></img>
                <span className="dark:text-white text-neutral-900 text-sm">
                  Coreum
                </span>
              </div>
              <div
                className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.ETHEREUM)}
              >
                <img
                  src="/images/icons/eth.png"
                  className="w-[25px] h-[25px]"
                  width={25}
                  height={25}
                  alt=""
                ></img>
                <span className="dark:text-white text-neutral-900 text-sm">
                  Ethereum
                </span>
              </div>
              <div
                className={clsx(
                  "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                  "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                )}
                onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.BSC)}
              >
                <img
                  src="/images/icons/bsc.png"
                  className="w-[25px] h-[25px]"
                  width={25}
                  height={25}
                  alt=""
                ></img>
                <span className="dark:text-white text-neutral-900 text-sm">
                  BSC
                </span>
              </div>
              <div
                className={clsx(
                  false
                    ? "opacity-40"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                  "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                )}
                onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.POLYGON)}
              >
                <img
                  src="/images/icons/polygon.png"
                  className="w-[25px] h-[25px]"
                  width={25}
                  height={25}
                  alt=""
                ></img>
                <span className="dark:text-white text-neutral-900 text-sm">
                  Polygon
                </span>
              </div>
              <div
                className={clsx(
                  false
                    ? "opacity-40"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                  "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                )}
                onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.AVALANCHE)}
              >
                <img
                  src="/images/icons/avax.png"
                  className="w-[25px] h-[25px]"
                  width={25}
                  height={25}
                  alt=""
                ></img>
                <span className="dark:text-white text-neutral-900 text-sm">
                  Avalanche
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-6 px-5 space-x-2 ">
        <ButtonPrimary
          onClick={() => {
            if (isSupportedNetwork(currentNetworkSymbol) === true) {
              if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
              } else if (currentNetworkSymbol === PLATFORM_NETWORKS.NEAR) {
                console.log("selected NEAR ");
              } else {
              }
            } else {
              toast.warn("Please select a network and try again.");
            }
          }}
          sizeClass="px-4 py-2 sm:px-5 my-2"
        >
          <IoWalletOutline size={22} />
          {isEmpty(walletAddress) === false && walletStatus === true ? (
            <span className="pl-2">{getShortAddress(walletAddress)}</span>
          ) : (
            <span className="pl-2">Wallet connect</span>
          )}
        </ButtonPrimary>
        {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM ? (
          <div className="!w-full">
            <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="relative grid bg-white dark:bg-neutral-800 px-2 py-2">
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => {
                    authenticate("keplr");
                  }}
                >
                  <img
                    src="/images/icons/keplr.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  ></img>
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Keplr
                  </span>
                </div>
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => {
                    authenticate("leap");
                  }}
                >
                  <img
                    src="/images/icons/leap.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  ></img>
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Leap
                  </span>
                </div>
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => {
                    authenticate("cosmostation");
                  }}
                >
                  <img
                    src="/images/icons/cosmostation.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  ></img>
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Cosmostation
                  </span>
                </div>
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => {
                    handleWalletConnect();
                  }}
                >
                  <img
                    src="/images/icons/walletconnect.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  ></img>
                  <span className="dark:text-white text-neutral-900 text-sm">
                    WalletConnect
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        {currentNetworkSymbol === PLATFORM_NETWORKS.ETHEREUM ||
        currentNetworkSymbol === PLATFORM_NETWORKS.BSC ||
        currentNetworkSymbol === PLATFORM_NETWORKS.POLYGON ||
        currentNetworkSymbol === PLATFORM_NETWORKS.AVALANCHE ? (
          <div className="!w-full ">
            <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="relative grid bg-white dark:bg-neutral-800 px-2 py-2">
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => {
                    handleMetaMask();
                  }}
                >
                  <img
                    src="/images/icons/metamask.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  ></img>
                  <span className="dark:text-white text-neutral-900 text-sm">
                    MetaMask
                  </span>
                </div>
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => {
                    handleWalletConnect();
                  }}
                >
                  <img
                    src="/images/icons/walletconnect.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  ></img>
                  <span className="dark:text-white text-neutral-900 text-sm">
                    WalletConnect
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>

      <ul className="flex flex-col py-6 px-2 space-y-1">
        {data.map(_renderItem)}
      </ul>
    </div>
  );
};

export default NavMobile;
