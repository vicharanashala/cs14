export default function StatusBadge({ status }) {
  const styles = {
    unanswered: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    answered: "bg-green-100 text-green-700",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.unanswered}`}>
      {status}
    </span>
  );
}