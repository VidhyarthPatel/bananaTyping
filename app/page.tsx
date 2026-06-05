import Container from "@/components/Container";
import Nav from "@/components/Nav";
import PlayGround2 from "@/components/PlayGround2";

export default function Home() {
  return (
    <main className="bg-[#000000] min-h-screen text-[#dddddd] flex flex-col font-mono selection:bg-[#e2b714]/20 selection:text-white">
      <Container className="h-screen flex flex-col px-12 py-8 max-w-none w-full">
        <Nav />
        <div className="flex items-center justify-center flex-1">
          <PlayGround2 />
        </div>
      </Container>
    </main>
  );
}
