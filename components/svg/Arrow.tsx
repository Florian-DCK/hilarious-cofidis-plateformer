import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={21}
		height={21}
		fill="none"
		{...props}>
		<circle cx={10.256} cy={10.256} r={10.256} fill="#fff" />
		<path
			fill="#D0103A"
			d="m8.727 14.794-1.035-1.035 3.798-3.798-3.798-3.798 1.035-1.035 4.833 4.833-4.833 4.833Z"
		/>
	</svg>
);
export default SvgComponent;
