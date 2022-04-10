// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  url: string
}

function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;  
  }
}

export default async function handler({ query: { url } }: {query: Data},
  res: NextApiResponse<any>
) {
  if(isValidUrl(url)) {
    const netypareoIcsRes = await fetch(url);

    if(netypareoIcsRes.ok) {
      const content = await netypareoIcsRes.text();
      res.status(200).json({ ics: content });
    } else {
      res.status(400).json({ err: "Erreur lors de la requête" });
    }
  } else {
    res.status(400).json({ err: "L'url fournie n'est pas valide" });
  }
}
