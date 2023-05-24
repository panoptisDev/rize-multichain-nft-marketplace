import { SocialType } from "shared/SocialsShare/SocialsShare";
import React, { FC } from "react";
import facebook from "images/socials/facebook.svg";
import twitter from "images/socials/twitter.svg";
import telegram from "images/socials/telegram.svg";
import youtube from "images/socials/youtube.svg";

import { FiFacebook, FiYoutube } from 'react-icons/fi';
import { TbBrandTelegram, TbBrandTwitter } from 'react-icons/tb';
import { RxDiscordLogo } from 'react-icons/rx';

export interface SocialsListProps {
  className?: string;
  itemClass?: string;
  socials?: SocialType[];
}

const socialsDemo: SocialType[] = [
  { name: "Facebook", icon: <FiFacebook color={'#33FF00'} />, href: "#" },
  { name: "Twitter", icon: <TbBrandTwitter color={'#33FF00'} />, href: "#" },
  { name: "Youtube", icon: <FiYoutube color={'#33FF00'} />, href: "#" },
  { name: "Telegram", icon: <TbBrandTelegram color={'#33FF00'} />, href: "#" },
];

const SocialsList: FC<SocialsListProps> = ({
  className = "",
  itemClass = "block w-6 h-6",
  socials = socialsDemo,
}) => {
  return (
    <nav
      className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-6000 dark:text-neutral-300 ${className}`}
      data-nc-id="SocialsList"
    >
      {socials.map((item, i) => (
        <a
          key={i}
          className={`${itemClass}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
        >
          {/* <img src={item.icon} alt="" /> */}
          {item.icon}
        </a>
      ))}
    </nav>
  );
};

export default SocialsList;
