"use client";
import React from "react";
import Image from "next/image";

const SidebarHeader = () => {
  return (
    <div className="flex items-center justify-between px-5 py-5">
      <div className="flex items-center">
        <div className="flex items-center justify-center">
          <Image
            src="/1desk.svg"
            alt="Onedesk"
            width={20}
            height={20}
            priority
            className="text-indigo-600"
          />
        </div>
        <div className="ml-2">
          <Image
            src="/1desk-title.svg"
            alt="Onedesk"
            width={84}
            height={18}
            priority
            className="relative bottom-0.5"
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
