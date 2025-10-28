import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={18}
		height={18}
		viewBox="0 0 18 18"
		className="lucide lucide-circle-x-icon lucide-circle-x"
		{...props}>
		<circle cx={9} cy={9} r={8} fill="#E53935" />
		<path
			d="M12.5 5.5L5.5 12.5M5.5 5.5l7 7"
			stroke="#fff"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
	</svg>
);
export default SvgComponent;
