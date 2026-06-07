import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import TextArea from "../../components/ui/TextArea";
import { uuidV4Bulk } from "../../lib/random";

export default function UuidTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => uuidV4Bulk(5));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <Field label="Count">
          <Input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24"
          />
        </Field>
        <Button
          variant="primary"
          onClick={() => setUuids(uuidV4Bulk(Math.min(1000, Math.max(1, count))))}
        >
          Generate
        </Button>
      </div>
      <TextArea
        value={uuids.join("\n")}
        readOnly
        copyable
        className="min-h-[10rem]"
      />
    </div>
  );
}
