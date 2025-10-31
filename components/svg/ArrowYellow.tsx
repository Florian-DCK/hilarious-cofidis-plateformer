import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={36}
    height={36}
    fill="none"
    {...props}
  >
    <path
      stroke="#FECB00"
      strokeLinecap="round"
      strokeWidth={5.941}
      d="M2.97 17.97h28.664m0 0-15 15m15-15-15-15"
    />
  </svg>
);
export default SvgComponent;
