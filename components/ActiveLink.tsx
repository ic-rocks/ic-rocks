import classnames from "classnames";
import { useRouter } from "next/router";

function ActiveLink({
  children,
  href,
  exact = true,
  className = "",
  linkClassName = "",
  activeClassName = "font-bold cursor-default",
}) {
  const router = useRouter();
  const active = exact
    ? router.asPath === href
    : router.asPath.startsWith(href);

  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };

  return active ? (
    <span
      className={classnames(className, {
        [activeClassName]: active,
      })}
    >
      {children}
    </span>
  ) : (
    <a
      href={href}
      onClick={handleClick}
      className={classnames(className, linkClassName)}
    >
      {children}
    </a>
  );
}

export default ActiveLink;
