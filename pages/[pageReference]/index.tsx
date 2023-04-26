import { Footer } from '@/components/Footer';
import { PageBreakdown } from '@/components/PageBreakdown';
import { StorageService } from '@/lib/StorageService';
import { Page } from '@/models/Page';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';


export function ExistingPage({ page }: { page: Page }) {

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

export default withPageAuthRequired(ExistingPage);

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