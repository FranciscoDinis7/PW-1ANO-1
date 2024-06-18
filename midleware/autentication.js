function authorize(scopes) {
  return (request, response, next) => {
    const { roleUser } = request;
    console.log("route scopes:", scopes);
    console.log("user scopes:", roleUser);

    const hasAuthorization = scopes.some((scope) => roleUser.includes(scope));

    if (roleUser && hasAuthorization) {
      next();
    } else {
      response.status(403).json({ message: "Forbidden" });
    }
  };
}

module.exports = authorize;
