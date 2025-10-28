import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={18}
		height={18}
		fill="none"
		{...props}>
		<path
			fill="#81C747"
			d="M0 9c0-4.957 4.008-9 9-9 4.957 0 9 4.043 9 9 0 4.992-4.043 9-9 9-4.992 0-9-4.008-9-9Zm13.043-1.547a.955.955 0 0 0 0-1.371.955.955 0 0 0-1.371 0L7.875 9.879 6.293 8.332a.955.955 0 0 0-1.371 0 .955.955 0 0 0 0 1.371l2.25 2.25a.955.955 0 0 0 1.371 0l4.5-4.5Z"
		/>
	</svg>
);
export default SvgComponent;
