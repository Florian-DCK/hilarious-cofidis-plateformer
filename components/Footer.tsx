import React from 'react';

const Footer = () => {
	return (
		<footer className="w-full py-10">
			<div className="container mx-auto">
				<ul className="flex flex-col md:flex-row justify-center gap-1 items-center text-sm text-black">
					<li>© Cofidis 2025 -</li>
					<li>
						<a href="#" className="hover:underline">
							Mentions légales ·
						</a>
					</li>
					<li>
						<a href="#" className="hover:underline">
							Cookies ·
						</a>
					</li>
					<li>
						<a href="#" className="hover:underline">
							Réglement ·
						</a>
					</li>
				</ul>
			</div>
		</footer>
	);
};

export default Footer;
