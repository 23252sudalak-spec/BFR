export const onRequest: PagesFunction = async (context) => {
  return new Response("Backend API is ready!");
};
