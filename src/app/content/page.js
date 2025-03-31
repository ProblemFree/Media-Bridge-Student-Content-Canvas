import ContentClient from "./contentClient";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentPage() {
  return <ContentClient />;
}