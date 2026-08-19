import { motion, LayoutGroup } from "framer-motion";
import { FC, useState } from "react";
import NextLink from "next/link";
import { useRouter } from 'next/router';

type LinkProps = {
  selected: boolean;
  text: string;
  href: string;
  onClick: () => void;
};

const Link: FC<LinkProps> = ({ selected, onClick, text, href }) => {
  const router = useRouter()
  
  return (
    <motion.div
      className="relative"
      onClick={onClick}
      animate={{ opacity: 1 }}
      whileHover={{
        opacity: 1
      }}
    >
      <NextLink href={href} className="flex items-center justify-center w-full text-center transition-colors duration-200 hover:text-love">
        <span>{text}</span>
        {router.asPath === href && (
          <motion.div
            className="absolute top-full left-0 w-full h-0.5 mt-1 rounded-2xl bg-love"
            layoutId="underline"
          />
        )}
      </NextLink>
    </motion.div>
  );
};

const UndelinedLinks = ({
  items,
}: {
  items: { name: string; href: string, mobile: boolean }[];
}) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="grid w-full">
      <div className="flex flex-row space-x-10">
        <LayoutGroup>
          {items.map((item, idx) => {
            if (!item.mobile) return (
              <Link
              text={item.name}
              key={idx}
              selected={current === idx}
              onClick={() => setCurrent(idx)}
              href={item.href}
            />
            )
          })}
        </LayoutGroup>
      </div>
    </div>
  );
};

export default UndelinedLinks;
