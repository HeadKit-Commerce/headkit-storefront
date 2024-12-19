import Link from "next/link";
import sanitize from "sanitize-html";

interface Props {
  title: string;
  description: string;
  allButton: string;
  allButtonPath?: string;
  allButtonTarget?: string;
}

const SectionHeader = ({
  title,
  description,
  allButton,
  allButtonPath,
  allButtonTarget
}: Props) => {
  return (
    <div className="grid w-full grid-cols-1 gap-x-8 gap-y-2 py-5 md:grid-cols-3">
      <div className="flex items-center">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      {description ? (
        <div className="flex items-center">
          <h3 className="font-medium" dangerouslySetInnerHTML={{ __html: sanitize(description) }} />
        </div>
      ) : (
        <div></div>
      )}

      {allButton && (
        <div className="flex items-center justify-start font-semibold md:justify-end">
          <Link href={allButtonPath || "/"} target={allButtonTarget ?? ""} className="underline">
            {allButton}
          </Link>
        </div>
      )}
    </div>
  );
};

export { SectionHeader };
