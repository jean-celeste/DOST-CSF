import type { FormState } from "@/components/forms/steps/types";

type ReviewProps = {
	formData: FormState;
};

export default function Review({ formData }: ReviewProps) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-gray-600">
				Please review your answers before submission.
			</p>
			<div className="rounded-xl border border-gray-200 bg-white p-4">
				<pre className="whitespace-pre-wrap break-words text-xs text-gray-700">
					{JSON.stringify(formData, null, 2)}
				</pre>
			</div>
		</div>
	);
}

