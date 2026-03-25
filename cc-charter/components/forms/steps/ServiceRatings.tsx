import type { ServiceRatingsData } from "@/components/forms/steps/types";

type ServiceRatingsProps = {
	data: ServiceRatingsData;
	onChange: (field: keyof ServiceRatingsData, value: ServiceRatingsData[keyof ServiceRatingsData]) => void;
};

export default function ServiceRatings({ data, onChange }: ServiceRatingsProps) {
	const ratingOptions = ["", "1", "2", "3", "4", "5"];

	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="timeliness-rating">Timeliness of service</label>
				<select
					id="timeliness-rating"
					value={data.timeliness}
					onChange={(event) => onChange("timeliness", event.target.value as ServiceRatingsData[keyof ServiceRatingsData])}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
				>
					{ratingOptions.map((value) => (
						<option key={`timeliness-${value || "empty"}`} value={value}>
							{value === "" ? "Select rating" : value}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="professionalism-rating">Professionalism of staff</label>
				<select
					id="professionalism-rating"
					value={data.professionalism}
					onChange={(event) => onChange("professionalism", event.target.value as ServiceRatingsData[keyof ServiceRatingsData])}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
				>
					{ratingOptions.map((value) => (
						<option key={`professionalism-${value || "empty"}`} value={value}>
							{value === "" ? "Select rating" : value}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="overall-rating">Overall satisfaction</label>
				<select
					id="overall-rating"
					value={data.overall}
					onChange={(event) => onChange("overall", event.target.value as ServiceRatingsData[keyof ServiceRatingsData])}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
				>
					{ratingOptions.map((value) => (
						<option key={`overall-${value || "empty"}`} value={value}>
							{value === "" ? "Select rating" : value}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

