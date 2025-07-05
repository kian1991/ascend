export default function Login() {
  return (
    <main className='min-h-screen bg-base-200 grid place-items-center'>
      <div className='flex flex-col gap-3'>
        <h3 className='tracking-tight font-bold text-2xl text-center mb-2'>
          WHO ARE YOU?
        </h3>
        <button className='btn btn-xl btn-primary uppercase'>GRANTOR</button>
        <button className='btn btn-xl btn-accent uppercase'>BENEFICIARY</button>
      </div>
    </main>
  );
}
