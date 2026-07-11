import PublicLayout from "./(public)/layout";
import HomePage, { metadata as publicMetadata } from "./(public)/page";

export { publicMetadata as metadata };

export default function HomeRoute() {
  return (
    <PublicLayout>
      <HomePage />
    </PublicLayout>
  );
}
