import { siteDocs } from '@/lib/site-docs';
import { createFumaPage } from '@windrun-huaiin/third-ui/fuma/server/page-generator';

const sourceKey = 'archive';
const { Page, generateStaticParams, generateMetadata } = createFumaPage({
  sourceKey: sourceKey,
  mdxContentSource: () => siteDocs.getContentSource(sourceKey),
  getMDXComponents: siteDocs.getMDXComponents,
  showBreadcrumb: false,
  showTableOfContent: true,
  showTableOfContentPopover: false,
  tocRenderMode: 'portable-clerk',
});

export default Page;
export { generateMetadata, generateStaticParams };
