// 'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Button from '@/components/Button';

export default function Home() {
	const t = useTranslations('Home');

	return (
		<div className="flex items-center justify-center font-sans">
			<section className="items-start flex flex-col mr-20">
				<h1 className="text-4xl font-medium mb-1 decoratedRed py-2">
					{t('title')}
				</h1>
				<h1 className="text-3xl font-medium mb-8 ml-16 decoratedYellow py-3">
					{t('subtitle')}
				</h1>
				<p className="text-lg text-black max-w-md">
					{t.rich('predescription', {
						br: () => <br />,
					})}
				</p>
				<p className="text-lg font-light text-black max-w-md">
					{t.rich('description', {
						strong: (chunks) => <strong>{chunks}</strong>,
					})}
				</p>
				<Button redirect="/register" className="mt-4">
					{t('CTA')}
				</Button>
			</section>
			<section>
				<Image
					src="/image/homeHero.png"
					width={770}
					height={851}
					alt={t('imageAlt')}
					className="w-[600px]"
				/>
			</section>
		</div>
	);
}
