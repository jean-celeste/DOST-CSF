import type { SuggestionsData } from "@/components/forms/steps/types";

type SuggestionsProps = {
	data: SuggestionsData;
	onChange: (field: keyof SuggestionsData, value: string) => void;
};

export default function Suggestions({ data, onChange }: SuggestionsProps) {
	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="improvement">
					What should we improve?
				</label>
				<textarea
					id="improvement"
					rows={4}
					value={data.improvement}
					onChange={(event) => onChange("improvement", event.target.value)}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
					placeholder="Share your improvement suggestions"
				/>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="additional-comments">
					Any additional comments?
				</label>
				<textarea
					id="additional-comments"
					rows={4}
					value={data.additionalComments}
					onChange={(event) => onChange("additionalComments", event.target.value)}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
					placeholder="Add any additional comments"
				/>
			</div>
		</div>
	);
}

