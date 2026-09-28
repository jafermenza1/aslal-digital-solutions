import {contentHtml,type ContentMap} from "@/lib/public-content";
export function RichContent({content,keyName,fallback,className,style}:{content:ContentMap;keyName:string;fallback:string;className?:string;style?:React.CSSProperties}){return <span className={"rich-inline-content "+(className||"")} style={style} dangerouslySetInnerHTML={{__html:contentHtml(content,keyName,fallback)}}/>}
