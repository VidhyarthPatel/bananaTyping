import Container from "@/components/Container";
import Nav from "@/components/Nav";
import Playground from "@/components/Playground";

export default function Home() {
  return (
    <main className="bg-[#000000] min-h-screen text-[#dddddd] flex flex-col font-mono selection:bg-[#e2b714]/20 selection:text-white">
      <Container className="min-h-screen flex flex-col px-4 sm:px-8 md:px-12 py-4 md:py-8 max-w-none w-full">
        <Nav />
        <div className="flex flex-col justify-start pt-8 md:pt-16 flex-1 w-full">
          <Playground />
        </div>
      </Container>
    </main>
  );
}
