import { CharacterSheet } from "./components";

export default async function Page({
  params,
}: {
  params: { characterUID: string };
}) {
  const { characterUID } = await params;

  return (
    <main>
      <CharacterSheet characterUID={characterUID} />
    </main>
  );
}
