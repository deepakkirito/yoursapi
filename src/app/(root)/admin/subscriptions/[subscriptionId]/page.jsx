import AddEdit from "@/components/admin/subscriptions/addEdit";

export default async function Page({ params }) {
  const { subscriptionId } = await params;
  return <AddEdit id={subscriptionId} />;
}
