import { Footer } from '@/components/Footer';
import { PageBreakdown } from '@/components/PageBreakdown';
import { StorageService } from '@/lib/StorageService';
import { Page } from '@/models/Page';


export default function ExistingPage({ page }: { page: Page }) {

  return (
    <main
      className='bg-cover bg-[url("/background-pattern.svg")]'>

      <div className="flex flex-col justify-between h-full min-h-screen bg-base-200 bg-opacity-80 ">
        <PageBreakdown page={page} />
        <Footer />
      </div>
    </main>
  )
}

export async function getServerSideProps(context: any) {
  const pageReference = context.query.pageReference as string;

  const storageService = new StorageService();
  const page: Page | null = await storageService.getPageByReference(pageReference);

  if (!page) {
    return {
      redirect: {
        destination: '/'
      }
    }
  } else {
    return {
      props: {
        page: page
      }
    }
  }
}