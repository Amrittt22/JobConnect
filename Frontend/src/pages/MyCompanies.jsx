useEffect(() => {
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/companies/my`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      setCompanies(response.data.companies);
    } catch (err) {
      console.error("Failed to load companies:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load companies"
      );
    } finally {
      setCompaniesLoading(false);
    }
  };
  console.error("Failed to load companies:", err);

  if (session) {
    fetchCompanies();
  }
}, [session]);