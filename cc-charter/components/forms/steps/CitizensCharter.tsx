import type { CitizensCharterData } from "@/components/forms/steps/types";

type CitizensCharterProps = {
	data: CitizensCharterData;
	onChange: (field: keyof CitizensCharterData, value: CitizensCharterData[keyof CitizensCharterData]) => void;
};

export default function CitizensCharter({ data, onChange }: CitizensCharterProps) {
	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="saw-charter">
					Did you see the Citizen&apos;s Charter?
				</label>
				<select
					id="saw-charter"
					value={data.sawCharter}
					onChange={(event) => onChange("sawCharter", event.target.value as CitizensCharterData[keyof CitizensCharterData])}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
				>
					<option value="">Select</option>
					<option value="yes">Yes</option>
					<option value="no">No</option>
				</select>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="process-clear">
					Was the service process clear?
				</label>
				<select
					id="process-clear"
					value={data.processClear}
					onChange={(event) => onChange("processClear", event.target.value as CitizensCharterData[keyof CitizensCharterData])}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
				>
					<option value="">Select</option>
					<option value="yes">Yes</option>
					<option value="no">No</option>
				</select>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-gray-700" htmlFor="requirements-clear">
					Were requirements communicated clearly?
				</label>
				<select
					id="requirements-clear"
					value={data.requirementsClear}
					onChange={(event) => onChange("requirementsClear", event.target.value as CitizensCharterData[keyof CitizensCharterData])}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
				>
					<option value="">Select</option>
					<option value="yes">Yes</option>
					<option value="no">No</option>
				</select>
			</div>
		</div>
	);
}

