
import { GstSummaryTable } from './gst-summary-table';
import { gstSummaryData } from './data';

export default function GstSummaryPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <GstSummaryTable data={gstSummaryData} />
        </div>
    )
}
