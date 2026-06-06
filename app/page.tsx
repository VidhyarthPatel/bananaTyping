import Container from "@/components/Container";
import Nav from "@/components/Nav";
import Playground from "@/components/Playground";

export default function Home() {
  return (
    <main className="bg-[#000000] min-h-screen text-[#dddddd] flex flex-col font-mono selection:bg-[#e2b714]/20 selection:text-white">
      <Container className="h-screen flex flex-col px-12 py-8 max-w-none w-full">
        <Nav />
        <div className="flex items-center justify-center flex-1">
          <Playground />
        </div>
      </Container>
    </main>
  );
}
