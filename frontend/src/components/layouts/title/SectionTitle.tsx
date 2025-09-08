import "./sectiontitle.css";

type Props = {
    sectionTitle : string
}

export default function SectionTitle({ sectionTitle }: Props) {
  return (
    <h2 className='htag'>{sectionTitle}</h2>
  )
}
