import SectionTitle from "../components/layouts/title/SectionTitle";
import Property from "../components/property/Property";

export default function Home() {
  return (
    <div>
      <SectionTitle sectionTitle="Property List" />
      <Property />
    </div>
  );
}