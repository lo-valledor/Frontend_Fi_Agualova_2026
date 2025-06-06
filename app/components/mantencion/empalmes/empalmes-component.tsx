import type { Empalme } from "~/types/mantencion";
import { DataTable } from "~/components/data-table/data-table";
import { columns } from "./columns";



export default function EmpalmesComponent({empalmes}: {empalmes: Empalme[]}) {
  return (
    <div>
      <h1>Empalmes</h1>
      <DataTable columns={columns} data={empalmes} />
    </div>
  )
}
