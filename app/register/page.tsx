import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Input from '@/components/Input';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Success from '@/components/svg/Success';

const Page: NextPage = () => {
	const t = useTranslations('Register');
	return (
		<div>
			<h1 className=" text-3xl font-sans text-center mt-15 mb-15">
				{t.rich('title', {
					br: () => <br />,
				})}
			</h1>
			<form className="max-w-7xl mx-auto p-16 bg-white rounded-lg shadow-[0_2px_20px_rgba(0,0,0,0.1)] flex flex-col gap-8">
				<div className="flex gap-8">
					<label className="flex items-center gap-2 cursor-pointer relative">
						<input
							type="radio"
							name="civility"
							value="madame"
							className="custom-radio-input"
						/>
						<span className="custom-radio"></span>
						Madame
					</label>
					<label className="flex items-center gap-2 cursor-pointer relative">
						<input
							type="radio"
							name="civility"
							value="monsieur"
							className="custom-radio-input"
						/>
						<span className="custom-radio"></span>
						Monsieur
					</label>
				</div>
				<div className="flex gap-16">
					<Input
						placeholder="Prénom"
						name="firstname"
						required
						successIcon={<Success />}
					/>
					<Input
						placeholder="Nom"
						name="lastname"
						required
						successIcon={<Success />}
					/>
				</div>
				<div className="flex gap-16 items-end">
					<Input
						placeholder="E-mail"
						name="email"
						type="email"
						required
						successIcon={<Success />}
					/>
					<Input
						placeholder="Date de naissance"
						name="birthdate"
						type="date"
						suffixe="(+ de 18 ans)"
						required
						successIcon={<Success />}
					/>
				</div>
				<hr className=" border-copygray my-16" />
				<div className="flex gap-8 mt-4">
					<label className="flex items-start gap-2 flex-1 text-sm">
						<input
							type="checkbox"
							name="accept"
							className="mt-1 accent-red-600 size-6"
						/>
						<span>
							En participant, je reconnais avoir lu et accepté le{' '}
							<a href="#" className="underline">
								règlement
							</a>{' '}
							du concours et la{' '}
							<a href="#" className="font-bold underline">
								politique de confidentialité
							</a>{' '}
							de Cofidis.
						</span>
					</label>
					<label className="flex items-start gap-2 flex-1 text-sm">
						<input
							type="checkbox"
							name="offers"
							className="mt-1 accent-red-600 size-6"
						/>
						<span>
							Je confirme qu’il s’agit bien des moyens de contact sur lesquels
							Cofidis pourrait m’envoyer des offres commerciales.
						</span>
					</label>
				</div>
				<Button className="w-min mx-auto" type="submit">
					Valider
				</Button>
			</form>
			<Footer />
		</div>
	);
};

export default Page;
